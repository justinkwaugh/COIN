
class Faction {
    constructor(definition) {
        this.id = definition.id;
        this.name = definition.name;
        this.passResources = 0;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            passResources: this.passResources
        };
    }

    loadGameState(json) {
        this.id = json.id;
        this.name = json.name;
        this.passResources = json.passResources;
    }
}

export default Faction;