import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { InfoMqttMessage } from "@mopopinball/engine/src/system/messages"
import {ClientDevice} from '@mopopinball/engine/src/system/server/client-device';
import {DipSwitchState} from '@mopopinball/engine/src/system/dip-switch-state';
import {GithubRelease} from '@mopopinball/engine/src/system/github-release';
import {AvailableUpdate} from '@mopopinball/engine/src/system/server/available-update';
import {UpdateDetails} from '@mopopinball/engine/src/system/server/update-details';
import { HttpClient } from '@angular/common/http';
import {version} from 'package.json';
import { IMqttMessage, MqttService } from 'ngx-mqtt';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
    private subscription: Subscription;
    availableUpdate: UpdateDetails;
    info: InfoMqttMessage;
    fps: InfoMqttMessage;
    dips?: DipSwitchState;
    lamps: ClientDevice[] = [];
    coils: ClientDevice[] = [];
    sounds: ClientDevice[] = [];
    switches: any[] = [];
    rows = [0,1,2,3,4,5,6,7,8];
    cols = [1,2,3,4,5,6,7,8];
    systemUpdateInProgress = false;

    constructor(private http: HttpClient, private _mqttService: MqttService) {
        this._mqttService.observe('mopo/info/general').subscribe((message: IMqttMessage) => {
            this.info = JSON.parse(message.payload.toString());
        });
        this._mqttService.observe('mopo/info/fps').subscribe((message: IMqttMessage) => {
            this.fps = JSON.parse(message.payload.toString());
        });

        // Subscribe only long enough to get all initial state, then unsubscribe.
        this.subscription = this._mqttService.observe('mopo/devices/+/all/state').subscribe((message: IMqttMessage) => {
            switch (message.topic) {
                case 'mopo/devices/lamps/all/state':
                    this.lamps = JSON.parse(message.payload.toString());
                break;
                case 'mopo/devices/coils/all/state':
                    this.coils = JSON.parse(message.payload.toString());
                break;
                case 'mopo/devices/sounds/all/state':
                    this.sounds = JSON.parse(message.payload.toString());
                break;
                case 'mopo/devices/switches/all/state':
                    this.switches = JSON.parse(message.payload.toString());
                break;
            }
            if (this.lamps.length > 0 && this.coils.length > 0 && this.sounds.length > 0 && this.switches.length > 0) {
                this.subscription.unsubscribe();
            }
        });

        // this._mqttService.observe('mopo/devices/+/+/state/update').subscribe((message: IMqttMessage) => {
        //     const payload = JSON.parse(message.payload.toString());
        //     this.update(this.lamps, payload);
        //     this.update(this.coils, payload);
        //     this.update(this.sounds, payload);
        //     // this.update()
        // });

        // this._mqttService.observe('mopo/devices/dips/all/state').subscribe((message: IMqttMessage) => {
        //     this.dips = JSON.parse(message.payload.toString());
        // });
    }

    update(collection: any[], updates: any[]) {
        for (const item of collection) {
            for (const u of updates) {
                if (item.id === u.id) {
                    item.isOn = u.isOn;
                }
            }
        }
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    toggleDevice(device: ClientDevice): void {
        // this._mqttService.publish('mopo/devices/anytype/anyid/state/update/client', JSON.stringify(device)).subscribe();
    }

    getSwitch(row: number, col: number): any {
        const swNum = (row * 10) + col;
        const sw = this.switches.find((sw) => sw.number === swNum);
        return sw || {id: '', number: swNum};
    }

    checkForUpdate(): void {
        this.http.post('/update/check', {}).subscribe((update: AvailableUpdate) => {
            this.availableUpdate = {
                system: update.system,
                pics: update.pics,
                serviceMenu: update.serviceMenu
            };
        });
    }

    applySystemUpdate(release: GithubRelease): void {
        this.systemUpdateInProgress = true;
        this.http.post('/update/apply', release).subscribe(() => {
            this.availableUpdate = null;
            this.systemUpdateInProgress = false;
        });
    }
}
