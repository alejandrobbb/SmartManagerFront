import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScrollSignalComponent } from './ScrollSignal/scrollSignal.component';
import { ChartsComponent } from './Charts/charts.component';
import { FaceRecognitionComponent } from './FaceRecognition/facerecognition.component';

const routes: Routes = [

  {
    path: "",
    redirectTo:"face",
    pathMatch:"full"
  },
  {
    path:"scrollSignal",
    component: ScrollSignalComponent
  },
  {
    path:"analytics",
    component: ChartsComponent
  },
  
  {
    path:"face",
    component: FaceRecognitionComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
