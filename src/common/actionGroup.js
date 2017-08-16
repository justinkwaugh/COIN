class ActionGroup {
    constructor(definition) {
        this.type = definition.type;
        this.factionId = definition.factionId;
        this.id = definition.id;
        this.actionStartIndex = definition.actionStartIndex;
        this.actionEndIndex = definition.actionEndIndex;
        this.interactions = definition.interactions || [];
    }

    toJSON() {
        return {
            type: this.type,
            factionId: this.factionId,
            id: this.id,
            actionStartIndex: this.actionStartIndex,
            actionEndIndex: this.actionEndIndex,
            interactions: this.interactions
        };
    }

    loadGameState(json) {
        this.type = json.type;
        this.factionId = json.factionId;
        this.id = json.id;
        this.actionStartIndex = json.actionStartIndex;
        this.actionEndIndex = json.actionEndIndex;
        this.interactions = json.interactions || [];
    }
}

export default ActionGroup;
