class Player {
    constructor(definition = {}) {
        this.isNonPlayer = definition.isNonPlayer;
        this.factionId = definition.factionId;
    }

    toJSON() {
        return {
            isNonPlayer: this.isNonPlayer,
            factionId: this.factionId
        };
    }

    loadGameState(json) {
        this.isNonPlayer = json.isNonPlayer || false;
        this.factionId = json.factionId;
    }
}

export default Player;