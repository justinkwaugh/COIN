import _ from '../../lib/lodash';
import Action from './action';

class RevealPieces extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.count = args.count;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        let revealable = region.getHiddenPiecesForFaction(faction.id);

        if(!this.count) {
            this.count = revealable.length;
        }
        else {
            revealable = _.take(revealable, this.count);
        }

        if (this.count && revealable.length < this.count) {
            throw 'Invalid RevealPieces Action';
        }

        _.each(
            revealable, function (piece) {
                piece.revealed(true);
            });

        if(this.count) {
            console.log('Revealing ' + this.count + 'x ' + faction.name + ' pieces in ' + region.name);
        }
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const revealable = _(region.getWarbandsOrAuxiliaForFaction(faction.id)).filter( piece => (piece.revealed() && !piece.scouted())).take(this.count).value();
        if (revealable.length === 0 ) {
            throw 'Unable to undo RevealPieces Action';
        }

        _.each(
            revealable, function (piece) {
                piece.revealed(false);
            });
    }


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