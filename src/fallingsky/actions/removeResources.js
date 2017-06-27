import Action from './action';

class RemoveResources extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.count = args.count;
        this.removed = args.removed;
        this.numAfter = args.numAfter;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const count = this.count;

        this.removed = faction.removeResources(count);
        this.numAfter = faction.resources();
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];

        faction.addResources(this.removed);
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        return ['Decrease ' + faction.name + ' resources by ' + this.removed + ' to ' + this.numAfter];
    }

}

export default RemoveResources
