import _ from '../../lib/lodash';
import Action from './action';

class RevealPieces extends Action {
    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const count = args.count;

        let revealable = _(region.piecesByFaction()[faction.id]).filter(
            function (piece) {
                return piece.type === 'warband' || piece.type === 'auxilia';
            }).value();

        if (count) {
            revealable = _.take(revealable, count);
        }

        _.each(
            revealable, function (piece) {
                piece.revealed(true);
            });

        const revealed = revealable.length;

        if(revealed) {
            console.log('Revealing ' + revealed + 'x ' + faction.name + ' pieces in ' + region.name);
        }
    }
}

export default RevealPieces;