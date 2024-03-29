import { SerialPort } from "electron";
import { CommunicationNode } from "./CommunicationNode";
import { Package } from "./Package";

class Sensor extends Package {
    private sourceConfig: SerialPort = null;

    constructor (
        name: string,
        repoURL: string,
        author: string,
        organisation: string,
        isInstalled: boolean,
        version: string,
        versions: Array<string>,
        nodes: Array<CommunicationNode>
    ) {
        super(name,
            repoURL,
            author,
            organisation,
            isInstalled,
            version,
            versions,
            nodes);
    }

    /**
     * Exports the script
     */
    public exportScript() {
        throw new Error("Method not implemented.");
    }

    /**
     * Getter $sourceConfig
     * @return {SerialPort}
     */
	public get $sourceConfig(): SerialPort {
		return this.sourceConfig;
	}

    /**
     * Setter $sourceConfig
     * @param {Source} value
     */
    public set $sourceConfig(value: SerialPort) {
        this.sourceConfig = value;
    }
}