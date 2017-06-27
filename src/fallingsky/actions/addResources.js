import Action from './action';

class AddResources extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.count = args.count;
        this.added = args.added;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const count = this.count;

        this.added = faction.addResources(count);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];

        faction.removeResources(this.added);
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        return ['Increase ' + faction.name + ' resources by ' + this.added];
    }

}

export default AddResources
