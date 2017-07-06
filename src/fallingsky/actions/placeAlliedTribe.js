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

        if (!tribe) {
            debugger;
            throw 'Invalid PlaceAlliedTribe Action';
        }

        if (!region.inPlay() || !faction.hasAvailableAlliedTribe() || !tribe.isSubdued()) {
            debugger;
            throw 'Invalid PlaceAlliedTribe Action';
        }

        const alliedTribe = faction.removeAlliedTribe();
        tribe.makeAllied(alliedTribe);
        region.addPiece(alliedTribe);
        console.log('Placing ' + faction.name + ' Ally in ' + tribe.name);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const tribe = state.tribesById[this.tribeId];
        const ally = _.find(region.getAlliesForFaction(faction.id), {tribeId: this.tribeId});
        tribe.removeAlly(ally);
        region.removePieces([ally]);
        faction.returnAlliedTribes([ally]);
        console.log('Taking back ' + faction.name + ' Ally from ' + tribe.name + ' in ' + region.name);
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const tribe = state.tribesById[this.tribeId];
        return ['Place ' + faction.name + ' Ally in ' + tribe.name + ' in region ' + region.name];
    }

}

export default PlaceAlliedTribe;