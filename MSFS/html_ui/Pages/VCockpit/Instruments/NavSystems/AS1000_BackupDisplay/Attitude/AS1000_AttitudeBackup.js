class AS1000_AttitudeBackup extends NavSystem {
    constructor() {
        super(...arguments);
        this.elecAvail = false;
        this.batteryTime = 3600000;
        this.shutdownTimer = 0;        
    }
    get templateID() { return "AS1000_AttitudeBackup"; }
    connectedCallback() {
        super.connectedCallback();
        this.addIndependentElementContainer(new NavSystemElementContainer("Horizon", "Horizon", new Backup_Attitude()));
    }
    Update() {
        this.updateBattery();
        super.Update();
    }
    isElectricityAvailable() {
        return this.elecAvail;
    }
    updateBattery() {
        let elecAvail;

        if (this.electricalLogic)
            elecAvail = this.electricalLogic.getValue() != 0;
        else
            elecAvail = SimVar.GetSimVarValue("CIRCUIT AVIONICS ON", "Bool");

        if (elecAvail && this.batteryTime < 3600000)
            this.batteryTime += this.deltaTime * 2;
        else if (!elecAvail && this.batteryTime > 0)
            this.batteryTime -= this.deltaTime;

        this.elecAvail = this.batteryTime > 0;

        if (this.elecAvail && Simplane.getIndicatedSpeed() < 40) {
            if (elecAvail)
                this.shutdownTimer = 60000;
            else {
                if (this.shutdownTimer <= 0)
                    this.elecAvail = false;
                else
                    this.shutdownTimer -= this.deltaTime;
            }
        }
    }
    IsGlassCockpit() { return true; }
}
class Backup_Attitude extends NavSystemElement {
    constructor() {
        super();
        this.vDir = new Vec2();
    }
    init(root) {
        this.attitudeElement = this.gps.getChildById("Horizon");
        this.attitudeElement.setAttribute("is-backup", "true");
        if (this.gps) {
            var aspectRatio = this.gps.getAspectRatio();
            this.attitudeElement.setAttribute("aspect-ratio", aspectRatio.toString());
        }
    }
    onEnter() {
    }
    onUpdate(_deltaTime) {
        var xyz = Simplane.getOrientationAxis();
        if (xyz) {
            this.attitudeElement.setAttribute("pitch", (xyz.pitch / Math.PI * 180).toString());
            this.attitudeElement.setAttribute("bank", (xyz.bank / Math.PI * 180).toString());
            this.attitudeElement.setAttribute("slip_skid", Simplane.getInclinometer().toString());
        }
    }
    onExit() {
    }
    onEvent(_event) {
    }
}
registerInstrument("as1000-attitudebackup-element", AS1000_AttitudeBackup);
//# sourceMappingURL=AS1000_AttitudeBackup.js.map