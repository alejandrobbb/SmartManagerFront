import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgChartsModule } from 'ng2-charts';
import { ChartsComponent } from './Charts/charts.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FaceRecognitionComponent } from './FaceRecognition/facerecognition.component';

@NgModule({
  declarations: [
    AppComponent,
    ChartsComponent,
    FaceRecognitionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule,  // Importar NgChartsModule
    FormsModule,      // Asegúrate de tener FormsModule si usas [(ngModel)]
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
