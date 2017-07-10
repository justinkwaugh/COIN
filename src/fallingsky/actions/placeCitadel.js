import Action from './action';
import _ from '../../lib/lodash';

class PlaceCitadel extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.tribeId = args.tribeId;
        this.hadAlly = args.hadAlly;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const tribe = state.tribesById[this.tribeId];

        if(!region.inPlay() || !faction.hasAvailableCitadel() || !tribe.isCity) {
            throw 'Invalid PlaceCitadel Action';
        }

        const removedAlliedTribe = region.removeAlliedTribe(faction.id, tribe.id);
        if(removedAlliedTribe) {
            this.hadAlly = true;
            faction.returnAlliedTribe(removedAlliedTribe);
        }

        const citadel = faction.removeCitadel();
        tribe.buildCitadel(citadel);
        region.addPiece(citadel);
        console.log('Placing ' + faction.name + ' Citadel in ' + tribe.name);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const tribe = state.tribesById[this.tribeId];

        const citadel = region.getCitadelForFaction(faction.id);
        tribe.removeAlly(citadel);
        region.removePieces([citadel]);
        faction.returnCitadel(citadel);

        if(this.hadAlly) {
            const alliedTribe = faction.removeAlliedTribe();
            tribe.makeAllied(alliedTribe);
            region.addPiece(alliedTribe);
        }
        console.log('Taking back ' + faction.name + ' Citadel from ' + tribe.name);
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const tribe = state.tribesById[this.tribeId];
        return ['Place ' + faction.name + ' Citadel in ' + tribe.name + ' in region ' + region.name];
    }
}

export default PlaceCitadel;