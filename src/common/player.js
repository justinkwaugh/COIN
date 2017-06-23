class Player {
    constructor(definition) {
        this.isNonPlayer = definition.isNonPlayer;
    }

    willHarass(factionId) {
        return true;
    }
}

export default Player;