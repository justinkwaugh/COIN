import Action from './action';

class PlaceCitadel extends Action {

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

        if(!region.inPlay() || !faction.hasAvailableCitadel() || !tribe.isCity) {
            throw 'Invalid PlaceCitadel Action';
        }

        const removedAlliedTribe = region.removeAlliedTribe(region.id, tribe.id);
        faction.returnAlliedTribe(removedAlliedTribe);

        const citadel = faction.removeCitadel();
        tribe.buildCitadel(citadel);
        region.addPiece(citadel);
        console.log('Placing ' + faction.name + ' Citadel in ' + tribe.name);
    }

    doUndo(state) {
        throw 'Unable to undo PlaceCitadel Action';
    }

}

export default PlaceCitadel;