import PanelButton from "../PanelButton"
import { bash } from "lib/utils"

export default () => {
    const label_icon = Widget.Label({
        class_name:"label-icon",
        label: '',
    });
    const label = Widget.Label({
        label: '',
    });
    var preTs = 0
    var preRxBytes = 0
    return PanelButton({
        class_name: "netspeed",
        on_clicked: () => {},
        child: Widget.Box({
            children: [label_icon, label],
        }).poll(2000, self => {
            bash("$HOME/.config/ags/script/netspeed.sh wlp1s0")
                .then(out => {
                    const rtxBytes = out.split(" ")
                    const ts = Date.now()
                    if(preTs !== 0) {
                        const intervalTsInSeconds = (ts - preTs) / 1000
                        const rxSpeed = ((rtxBytes[0] - preRxBytes) / (1024 * 1024)) / intervalTsInSeconds;
                        if (rxSpeed < 1) {
                            label.label = (rxSpeed * 1024).toFixed(0) + "KB/s"
                        } else {
                            label.label = rxSpeed.toFixed(1) + "MB/s"
                        }
                    } else {
                        label.label = "0KB/s"
                    }
                    preTs = ts
                    preRxBytes = rtxBytes[0]
                })
        }),
    })
}
