
class RampageResults {
    constructor(definition) {
        this.region = definition.region;
        this.hiddenWarbands = definition.hiddenWarbands;
        this.enemyFactions = definition.enemyFactions;
        this.chosenFaction = definition.chosenFaction;
        this.priority = definition.priority;
        this.count = definition.count;
        this.agreeingFactionId = definition.agreeingFactionId;
    }
}

export default RampageResults;