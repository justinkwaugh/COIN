import Action from './action';
import _ from '../../lib/lodash';

class PlaceWarbands extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.count = args.count;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const count = this.count;

        if(!region.inPlay() || !faction.hasAvailableWarbands(count)) {
            throw 'Invalid PlaceWarbands Action';
        }

        region.addPieces(faction.removeWarbands(count));
        console.log('Placing ' + count + 'x ' + faction.name + ' Warbands in ' + region.name);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const count = this.count;

        console.log('Removing ' + count + 'x ' + faction.name + 'Warbands from ' + region.name);
        const warbands = _.take(region.getHiddenPiecesForFaction(faction.id), count);
        if(warbands.length !== count) {
            throw 'Unable to undo PlaceWarbands Action';
        }
        region.removePieces(warbands);
        faction.returnWarbands(warbands);
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const count = this.count;
        return ['Place ' + count + 'x ' + faction.name + ' Warbands in ' + region.name];
    }
}

export default PlaceWarbands;