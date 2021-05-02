import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

// export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
//   hostname: document.location.hostname,
//   port: 9001
// };

import { AppComponent } from './app.component';
import { OutputDeviceComponent } from './output-device/output-device.component';

@NgModule({
  declarations: [
    AppComponent,
    OutputDeviceComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
