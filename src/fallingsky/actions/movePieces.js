import Logging from '../util/logging';
import _ from '../../lib/lodash';
import Action from './action';

class MovePieces extends Action {

    constructor(args) {
        super(args);

        this.sourceRegionId = args.sourceRegionId;
        this.destRegionId = args.destRegionId;
        this.pieces = args.pieces;
    }

    doExecute(state) {
        const sourceRegion = state.regionsById[this.sourceRegionId];
        const destRegion = state.regionsById[this.destRegionId];
        const pieces = this.pieces;

        const factionId = pieces[0].factionId;
        sourceRegion.removePieces(pieces);
        destRegion.addPieces(pieces);

        console.log('Moving these ' + factionId + ' pieces from ' + sourceRegion.name + ' to ' + destRegion.name);
        Logging.logPieces(pieces);
    }

    doUndo(state) {
        throw 'Unable to undo MovePieces Action';
    }

    instructions(state) {
        const sourceRegion = state.regionsById[this.sourceRegionId];
        const destRegion = state.regionsById[this.destRegionId];
        const pieces = this.pieces;
        const faction = state.factionsById[pieces[0].factionId];

        return _.concat(['Move these ' + faction.name + ' pieces from ' + sourceRegion.name + ' to ' + destRegion.name],Logging.getPiecesList(pieces));
    }
}

export default MovePieces;