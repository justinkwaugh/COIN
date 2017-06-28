class ActionGroup {
    constructor(definition) {
        this.type = definition.type;
        this.factionId = definition.factionId;
        this.id = definition.id;
        this.actionStartIndex = definition.actionStartIndex;
        this.actionEndIndex = definition.actionEndIndex;
    }
}

export default ActionGroup;
