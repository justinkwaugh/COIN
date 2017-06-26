import _ from '../../lib/lodash';
import Action from './action';

class HidePieces extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.numHiddenFromScouted = args.numHiddenFromScouted || 0;
        this.numHiddenFromRevealed = args.numHiddenFromRevealed || 0;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const revealable = region.getWarbandsOrAuxiliaForFaction(faction.id);
        if (revealable.length === 0) {
            return;
        }

        _.each(revealable, (piece) => {
            if (piece.scouted()) {
                this.numHiddenFromScouted += 1;
                piece.scouted(false);
            }
            else if (piece.revealed()) {
                this.numHiddenFromRevealed += 1;
                piece.revealed(false);
            }
        });

        console.log('Hiding ' + this.numHiddenFromRevealed + 'x ' + faction.name + ' pieces in ' + region.name);
        console.log('Removing scout marker from ' + this.numHiddenFromScouted + 'x ' + faction.name + ' pieces in ' + region.name);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const revealable = region.getWarbandsOrAuxiliaForFaction(faction.id);
        if (revealable.length === 0) {
            return;
        }

        let numToReveal = this.numHiddenFromRevealed;
        _.each(revealable, (piece) => {
            if (!piece.revealed() && numToReveal > 0) {
                piece.revealed(true);
                numToReveal -= 1;
            }
            else if (piece.revealed()) {
                piece.scouted(true);
            }
        });
    }

    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const pieces = args.pieces;
        const count = args.count;

        let revealable = pieces || _(region.piecesByFaction()[faction.id]).filter(
                function (piece) {
                    return (piece.type === 'warband' || piece.type === 'auxilia') && piece.revealed();
                }).value();

        if (revealable.length === 0) {
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

        console.log(
            'Hiding ' + (count ? count : revealable.length) + 'x ' + faction.name + ' pieces in ' + region.name);
    }
}

export default HidePieces;