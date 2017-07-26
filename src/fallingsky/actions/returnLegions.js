import _ from 'lib/lodash';
import Action from './action';

class ReturnLegions extends Action {

    constructor(args) {
        super(args);
        this.count = args.count;
        this.regionId = args.regionId;
    }

    doExecute(state) {
        const count = this.count;
        const regionId = this.regionId;
        const region = state.regionsById[regionId];

        let legions = null;
        if(region) {
            legions = _.take(region.getLegions(), count);
            region.removePieces(legions);
        }
        else {
            legions = state.romans.getLegionsFromFallen(count);
        }

        state.romans.returnLegionsToTracks(legions);
        console.log('Returning ' + count + 'x ' + state.romans.name + ' Legions from '+ (region ? region.name : 'Fallen') + ' to Tracks');
    }

    doUndo(state) {
        const faction = state.romans;
        const count = this.count;
        const regionId = this.regionId;
        const region = state.regionsById[regionId];
        const legionData = faction.removeLegions(count, true);
        if(region) {
            region.addPieces(legionData.legions);
        }
        else {
            faction.returnLegions(legionData.legions);
        }
        console.log('Returning ' + count + 'x ' + state.romans.name + ' Legions from Tracks to '+ (region ? region.name : 'Fallen'));
    }

    instructions(state) {
        const faction = state.romans;
        const count = this.count;
        const regionId = this.regionId;
        const region = state.regionsById[regionId];
        return ['Return  ' + count + 'x ' + faction.name + ' Legions from '+ (region ? region.name : 'Fallen') + ' to Tracks'];
    }
}

export default ReturnLegions;