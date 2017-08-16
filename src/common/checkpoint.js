class Checkpoint {
    constructor(definition) {
        this.id = definition.id;
    }

    toJSON() {
        return {
            id: this.id
        };
    }

    loadGameState(json) {
        this.id = json.id;
    }
}

export default Checkpoint;