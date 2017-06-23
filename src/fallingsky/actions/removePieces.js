import Logging from '../util/logging';
import Action from './action';
import _ from '../../lib/lodash';

class RemovePieces extends Action {

    static canExecute(state, args) {
        const pieces = args.pieces;
        return pieces && pieces.length > 0;
    }

    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const pieces = args.pieces;

        region.removePieces(pieces);

        console.log('Removing the following ' + faction.name + ' pieces from region ' + region.name);
        Logging.logPieces(pieces);

        _(pieces).groupBy('type').each(
            function (piecesOfType, type) {
                if (type === 'warband') {
                    faction.returnWarbands(piecesOfType);
                }
                else if (type === 'alliedtribe') {
                    _.each(
                        piecesOfType, function (piece) {
                            const tribe = state.tribesById[piece.tribeId];
                            tribe.removeAlly(piece);
                        });
                    faction.returnAlliedTribes(piecesOfType);
                }
                else if (type === 'citadel') {
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
}

export default RemovePieces;