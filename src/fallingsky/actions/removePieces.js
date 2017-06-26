import Logging from '../util/logging';
import Action from './action';
import _ from '../../lib/lodash';

class RemovePieces extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.pieces = args.pieces;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const pieces = this.pieces;

        if(!pieces || pieces.length === 0){
            throw 'No pieces specified for remove'
        }

        region.removePieces(pieces);
        console.log('Removing the following ' + faction.name + ' pieces from region ' + region.name);
        Logging.logPieces(pieces);

        _(pieces).groupBy('type').each(
             (piecesOfType, type) => {
                if (type === 'warband') {
                    faction.returnWarbands(piecesOfType);
                }
                else if (type === 'alliedtribe') {
                    _.each(
                        piecesOfType, function (piece) {
                            const tribe = state.tribesById[piece.tribeId];
                            console.log("removing ally for tribe " + tribe.name);
                            tribe.removeAlly(piece);
                        });
                    faction.returnAlliedTribes(piecesOfType);
                }
                else if (type === 'citadel') {
                    _.each(
                        piecesOfType, function (piece) {
                            const tribe = state.tribesById[piece.tribeId];
                            tribe.removeAlly(piece);
                        });
                    faction.returnCitadel(piecesOfType[0]);
                }
                else if (type === 'auxilia') {
                    faction.returnAuxilia(piecesOfType);
                }
                else if (type === 'legion') {
                    faction.returnLegions(piecesOfType);
                }
                else if (type === 'forts') {
                    faction.returnFort(piecesOfType[0]);
                }
                else if (type === 'leader') {
                    faction.returnLeader(piecesOfType[0]);
                }
            });

    }

    doUndo(state) {
        throw 'Unable to undo RemovePieces Action';
    }

}

export default RemovePieces;