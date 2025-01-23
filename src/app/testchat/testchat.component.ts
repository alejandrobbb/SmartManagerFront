import { Component,OnInit } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
@Component({
  selector: 'app-testchat',
  standalone: true,
  imports: [FormsModule,
    NgIf,
    NgFor
  ],
  templateUrl: './testchat.component.html',
  styleUrl: './testchat.component.css'
})
export class TestchatComponent  {
  
}


