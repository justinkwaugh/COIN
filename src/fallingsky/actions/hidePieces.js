import _ from '../../lib/lodash';
import Action from './action';

class HidePieces extends Action {
    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const pieces = args.pieces;
        const count = args.count;

        let revealable = pieces || _(region.piecesByFaction()[faction.id]).filter(
                function (piece) {
                    return (piece.type === 'warband' || piece.type === 'auxilia') && piece.revealed();
                }).value();

        if(revealable.length === 0) {
            return;
        }

        if (count) {
            revealable = _.take(revealable, count);
        }

        _.each(
            revealable, function (piece) {
                if (piece.scouted()) {
                    piece.scouted(false);
                }
                else if (piece.revealed()) {
                    piece.revealed(false);
                }
            });

        console.log('Hiding ' + (count ? count : revealable.length) + 'x ' + faction.name + ' pieces in ' + region.name);
    }
}

export default HidePieces;