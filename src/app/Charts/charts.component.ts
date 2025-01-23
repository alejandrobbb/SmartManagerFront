import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

// Interfaz para la respuesta de la API
interface ApiResponse {
  id: number;
  categoria: string;
  fecha: string;
}

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
})
export class ChartsComponent implements OnInit {

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };

  public barChartLabels: string[] = [];
  public barChartData: ChartData<'bar'> = {
    labels: this.barChartLabels,
    datasets: []
  };

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  //private apiUrl = 'http://localhost:7245/intelli/get';
  private rawURL = 'https://www.url del hub .com/HubAleko/';
  public userName = '';
  public groupName = '';
  public messageToSend = '';
  public joined = true;
  public conversation: NewMessage[] = [{
    message: 'Bienvenido',
    userName: 'Sistema'
  }];
  private connection!: HubConnection; // Aseguramos que la conexión esté definida
  public isConnected = false; // Añadimos la variable isConnected
  Titles = [
    { name: "ctmclient" },
    { name: "ctminitialize" },
    { name: "ctmaccept" },
    { name: "ctmprospago" },
    { name: "ctmcancel" },
    { name: "ctmdispense" },
    { name: "ctmuninitialize" }
  ];
  selectedValue = '';

  public randomNumber: number | null = null; // Para almacenar el número aleatorio
  public imageBase64: string | null = null;  // Para almacenar la imagen en Base64

  
  constructor(private http: HttpClient) {
    this.connection = new HubConnectionBuilder()
     //.withUrl('http://localhost:7245/testhub')
      .withUrl(this.rawURL + 'testhub')
      .build();

    // Definimos el manejo de mensajes recibidos
    this.connection.on("ReceiveMessage", (user, message) => this.newMessage(user, message));

    // Manejamos la desconexión y reconexión automática
    this.connection.onclose(async () => {
      console.log("Conexión perdida, intentando reconectar...");
      try {
        await this.connection.start();
        console.log("Reconexión exitosa");
        this.isConnected = true;
      } catch (error) {
        console.error("Error al intentar reconectar:", error);
        this.isConnected = false;
      }
    });
  }

  ngOnInit(): void {
    // Iniciamos la conexión cuando el componente esté listo
    this.connection.start()
      .then(() => {
        console.log('Conexión establecida');
        this.isConnected = true;
  
        // Obtener los datos de la API y actualizar el gráfico chart y chat
        this.http.get<ApiResponse[]>(this.rawURL +'intelli/get').subscribe(
          data => this.processData(data),
          error => console.error('Error al obtener datos de la API', error)
        );

       // Escuchar el evento "ReceiveImage" (para la imagen en Base64)
      this.connection.on('ReceiveImage', (base64Image: string, description: string) => {
        this.imageBase64 = base64Image;
        console.log(`Imagen recibida: ${base64Image}, Descripción: ${description}`);
      });

      // Escuchar el evento "ReceiveMessage" (para el número aleatorio)
      this.connection.on('ReceiveMessage', (message: string) => {
        const randomNumber = parseInt(message, 10); // Convertir el mensaje en número si es necesario
        this.randomNumber = randomNumber;
        console.log(`Número recibido: ${randomNumber}`);
      });

  
        // Manejar la actualización del gráfico recibida
        this.connection.on('ReceiveChartUpdate', (incrementValue: number) => this.updateChartWithIncrement(incrementValue));
      })
      .catch(error => {
        console.error('Error al iniciar la conexión:', error);
        this.isConnected = false;
      });
  }

  sendTurno() {
    const currentDate = new Date().toISOString();
    const categoria = 'Turnos abandonados';

    const body = {
      categoria: categoria,
      fecha: currentDate
    };

    this.http.post(this.rawURL + 'intelli/create', body).subscribe(response => {
      console.log('Data sent successfully', response);
    }, error => {
      console.error('Error sending data', error);
    });
  }
  

  public sendMessage() {
    if (this.isConnected) { // Solo enviar si la conexión está establecida
      console.log(`Enviando mensaje: usuario: ${this.selectedValue}, mensaje: ${this.messageToSend}`);
      const messageF: NewMessage = {
        message: this.selectedValue,
        userName: this.selectedValue,
        groupName: ''
      };
      this.conversation.push(messageF);

      // Enviamos el mensaje al servidor
      this.connection.invoke('SendMessagepy', this.selectedValue, this.messageToSend)
        .then(() => this.messageToSend = '') // Limpiamos el mensaje después de enviarlo
        .catch(error => console.error(`Error al enviar el mensaje: ${error}`));
    } else {
      console.error("La conexión no está en el estado 'Connected'.");
    }
  }

  private newMessage(user: string, message: string) {
    console.log(`Mensaje recibido - Usuario: ${user}, Mensaje: ${message}`);
    const messageF: NewMessage = {
      message: message,
      userName: user
    };
    this.conversation.push(messageF);
  }

  private processData(data: ApiResponse[]): void {
    // Crear un mapa que agrupe por fecha y luego por categoría
    const dataByDateAndCategory = new Map<string, Map<string, number>>();
  
    data.forEach(item => {
      const fecha = new Date(item.fecha).toLocaleDateString(); // Convertimos la fecha a una cadena legible
      if (!dataByDateAndCategory.has(fecha)) {
        dataByDateAndCategory.set(fecha, new Map());
      }
  
      const categoriasMap = dataByDateAndCategory.get(fecha)!;
      categoriasMap.set(item.categoria, (categoriasMap.get(item.categoria) || 0) + 1);
    });
  
    const fechas = Array.from(dataByDateAndCategory.keys());
    const categorias = [...new Set(data.map(item => item.categoria))];
  
    const datasets: { data: number[], label: string, backgroundColor: string[] }[] = [];
    
    // Colores predefinidos para las barras
    const colores = [
      'rgba(255, 99, 132, 1)',  // Rojo claro
      'rgba(54, 162, 235, 1)',  // Azul claro
      'rgba(255, 206, 86, 1)',  // Amarillo claro
      'rgba(75, 192, 192, 1)',  // Verde claro
      'rgba(153, 102, 255, 1)',  // Púrpura claro
      'rgba(255, 159, 64, 1)'   // Naranja claro
    ];
  
    categorias.forEach((categoria, index) => {
      const valores: number[] = fechas.map(fecha => {
        const categoriasMap = dataByDateAndCategory.get(fecha);
        return categoriasMap?.get(categoria) || 0;
      });
    
      datasets.push({
        data: valores,
        label: categoria,
        backgroundColor: [colores[index % colores.length]] // Asegurarse de que es un arreglo
      });
    });
    
    // Configurar las etiquetas (fechas) y los datos del gráfico
    this.barChartLabels = fechas;
    this.barChartData = {
      labels: this.barChartLabels,
      datasets: datasets
    };
  }

  public addData() {
    // Enviar el evento de actualización de gráfico a SignalR
    if (this.isConnected) {
      this.connection.invoke('SendChartUpdate', 1)
        .then(() => {
          console.log('Evento de actualización de gráfico enviado');
          this.sendTurno();
        })
        .catch(error => console.error(`Error al enviar el evento de actualización: ${error}`));
    } else {
      console.error("La conexión no está en el estado 'Connected'.");
    }
  }
  private updateChartWithIncrement(incrementValue: number) {
    // Asegurarnos de que tenemos datos en el gráfico
    if (this.barChartLabels.length === 0) return;
  
    // Encontrar la última fecha y la categoría "Turnos abandonados"
    const lastDate = this.barChartLabels[this.barChartLabels.length - 1];
    const category = 'Turnos abandonados';
  
    // Buscar el dataset para la categoría "Turnos abandonados"
    const dataset = this.barChartData.datasets.find(ds => ds.label === category);
    if (!dataset) return;
  
    // Actualizar el valor para la última fecha
    const index = this.barChartLabels.indexOf(lastDate);
    if (index === -1) return;
  
    // Sumar el valor incrementado a la última fecha
    dataset.data[index] = (dataset.data[index] as number) + incrementValue;
  
    // Actualizar el gráfico
    this.updateChart();
  }

  private updateChart(): void {
    // Esta función fuerza la actualización del gráfico
    this.barChartData = { ...this.barChartData };
  }
}

// Interfaz para los mensajes
interface NewMessage {
  userName: string;
  message: string;
  groupName?: string;
}
