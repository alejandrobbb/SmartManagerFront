import { Component, OnInit } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, FormsModule, NgIf, NgFor],
  templateUrl: './scrollSignal.component.html',
})
export class ScrollSignalComponent implements OnInit {
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

  constructor() {
    this.connection = new HubConnectionBuilder()
      .withUrl('https://www.url del hub .com/HubAleko/testhub') // Dirección server SignalR
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
        this.isConnected = true; // Actualizamos el estado de la conexión
      })
      .catch(error => {
        console.error('Error al iniciar la conexión:', error);
        this.isConnected = false;
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
      this.connection.invoke('SendMessage', this.selectedValue, this.messageToSend)
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
}

// Interfaz para los mensajes
interface NewMessage {
  userName: string;
  message: string;
  groupName?: string;
}
