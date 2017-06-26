import Action from './action';

class PlaceAlliedTribe extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.tribeId = args.tribeId;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const tribe = state.tribesById[this.tribeId];

        if(!tribe) {
            debugger;
        }

        if(!region.inPlay() || !faction.hasAvailableAlliedTribe() || !tribe.isSubdued()) {
            debugger;
            throw 'Invalid PlaceAlliedTribe Action';
        }

        const alliedTribe = faction.removeAlliedTribe();
        tribe.makeAllied(alliedTribe);
        region.addPiece(alliedTribe);
        console.log('Placing ' + faction.name + ' Ally in ' + tribe.name);
    }

    doUndo(state) {
        throw 'Unable to undo PlaceAlliedTribe Action';
    }


    static canExecute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const tribe = args.tribe;

        return region.inPlay() && faction.hasAvailableAlliedTribe() && tribe.isSubdued();
    }

    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const tribe = args.tribe;

        const alliedTribe = faction.removeAlliedTribe();
        tribe.makeAllied(alliedTribe);
        region.addPiece(alliedTribe);
        console.log('Placing ' + faction.name + ' Ally in ' + tribe.name);
    }
}

export default PlaceAlliedTribe;