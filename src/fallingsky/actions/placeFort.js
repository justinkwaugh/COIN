import Action from './action';

class PlaceFort extends Action {
    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];

        if(!region.inPlay() || !faction.hasAvailableForts() || region.hasFort()) {
            throw 'Invalid PlaceFort Action';
        }

        region.addPiece(faction.removeFort());
        console.log('Placing ' + faction.name + ' Fort in ' + region.name);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];

        const fort = region.getFort();
        region.removePieces([fort]);
        faction.returnFort(fort);
        console.log('Taking back ' + faction.name + ' Fort from ' + region.name);
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        return ['Place ' + faction.name + ' Fort in ' + region.name];
    }
}

export default PlaceFort;