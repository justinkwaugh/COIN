class Player {
    constructor(definition = {}) {
        this.isNonPlayer = definition.isNonPlayer;
        this.factionId = definition.factionId;
    }
}

export default Player;