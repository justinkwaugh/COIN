
class EntreatResults {
    constructor(definition) {
        this.cost = definition.cost;
        this.region = definition.region;
        this.replaceableAllyFactions = definition.replaceableAllyFactions;
        this.replaceableMobileFactions = definition.replaceableMobileFactions;
        this.canReplaceAlly = this.replaceableAllyFactions.length > 0;
        this.canReplaceMobile = this.replaceableMobileFactions.length > 0;

        this.allyToReplace = definition.allyToReplace;
        this.mobileToReplace = definition.mobileToReplace;
    }
}

export default EntreatResults;