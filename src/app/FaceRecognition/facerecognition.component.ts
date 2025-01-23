import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Component({
  selector: 'app-facerecognition',
  templateUrl: './facerecognition.component.html',

})
export class FaceRecognitionComponent implements OnInit {

  optionsCams: string[] = ['Cam1', 'Cam2', 'Cam3'];
  optionsAreas: string[] = ['Area Ingenieria', 'Opción 2', 'Opción 3'];
  selectedArea: string = '';
  selectedCam: string = '';

  private rawURL = 'https://www.url del hub .com/HubAleko/';
  private connection!: HubConnection;
  public isConnected = false;
  public recognizedName: string | null = '';
  public detectedNames: string[] = [];
  public selectedPerson: string | null = null;
  public imgSrc: string = '';
  public nextImgSrc: string = '';
  public imageBase64Chunks: string[] = [];

  // Propiedades para la segunda conexión y notificaciones
  public roomName: string | null = null;
  public personCount: number = 0;
  public imageList: string[] = [];
  public notifications: { roomName: string, personCount: number }[] = [];

  private lastRoomName: string | null = null;
  private lastPersonCount: number | null = null;

  imageLoaded: boolean = false;
  isTransitioning: boolean = false;

  constructor(private http: HttpClient) {
    this.connection = new HubConnectionBuilder()
      .withUrl(this.rawURL + 'testhub')
      .build();

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
    this.connection.start()
      .then(() => {
        console.log('Conexión establecida');
        this.isConnected = true;

        // Evento original para recibir una imagen
        this.connection.on('ReceiveImage', (base64Image: string, description: string) => {
          this.nextImgSrc = `data:image/jpeg;base64,${base64Image}`;
          this.transitionImage();
        });

        // Nueva conexión para recibir múltiples imágenes y gestionar notificaciones
        this.connection.on('ReceiveImagePersons', (base64Images: string[], nameRoom: string, numPerson: number) => {
          if (this.lastRoomName !== nameRoom || this.lastPersonCount !== numPerson) {
            this.addNotification(nameRoom, numPerson);
          }
          this.roomName = nameRoom;
          this.personCount = numPerson;
          this.imageList = base64Images;
        });

      }).catch(error => {
        console.error('Error al iniciar la conexión:', error);
        this.isConnected = false;
      });
  }

  private addNotification(nameRoom: string, numPerson: number): void {
    this.notifications.unshift({ roomName: nameRoom, personCount: numPerson });
    this.lastRoomName = nameRoom;
    this.lastPersonCount = numPerson;
  }

  private transitionImage(): void {
    const image = new Image();
    image.onload = () => {
      this.imgSrc = this.nextImgSrc;
      this.imageLoaded = true;
      this.isTransitioning = false;
    };
    image.src = this.nextImgSrc;
  }

  selectPerson(image: string): void {
    this.selectedPerson = image;
  }
}
