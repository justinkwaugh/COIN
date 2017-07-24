import _ from 'lib/lodash';
import Action from './action';
import {SenateApprovalStateNames} from 'fallingsky/config/senateApprovalStates';

class PlaceLegions extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.count = args.count;
        this.sourceCounts = args.sourceCounts;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const count = this.count;

        if (!region.inPlay() || !faction.hasAvailableLegions(count)) {
            throw 'Invalid PlaceLegions Action';
        }

        const legionData = faction.removeLegions(count);
        region.addPieces(legionData.legions);
        this.sourceCounts = legionData.sourceCounts;
        console.log('Placing ' + count + 'x ' + faction.name + ' Legions in ' + region.name);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const count = this.count;
        const sourceCounts = this.sourceCounts;


        _.each(sourceCounts, (count, source)=> {
            const legions = _.take(region.getLegions(), count);
            region.removePieces(legions);
            state.romans.returnLegions(legions, source);
            console.log('Returning ' + count + 'x ' + faction.name + ' Legions to ' + SenateApprovalStateNames[source] + ' track');
        });

    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const count = this.count;
        return ['Place ' + count + 'x ' + faction.name + ' Legions in ' + region.name];
    }
}

export default PlaceLegions;