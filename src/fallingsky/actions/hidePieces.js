import _ from '../../lib/lodash';
import Action from './action';

class HidePieces extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.numHiddenFromScouted = args.numHiddenFromScouted || 0;
        this.numHiddenFromRevealed = args.numHiddenFromRevealed || 0;
        this.pieces = args.pieces;
        this.fully = args.fully;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const pieces = this.pieces;
        const fully = this.fully;


        const revealable = pieces || region.getWarbandsOrAuxiliaForFaction(faction.id);
        if (revealable.length === 0) {
            return;
        }

        _.each(revealable, (piece) => {
            if (piece.scouted()) {
                this.numHiddenFromScouted += 1;
                piece.scouted(false);
                if (fully) {
                    piece.revealed(false);
                }
                else {
                    piece.revealed(true);
                }
            }
            else if (piece.revealed()) {
                this.numHiddenFromRevealed += 1;
                piece.revealed(false);
            }
        });

        if (this.numHiddenFromRevealed > 0) {
            console.log('Hiding ' + this.numHiddenFromRevealed + 'x ' + faction.name + ' pieces in ' + region.name);
        }

        if (this.numHiddenFromScouted > 0) {
            console.log(
                'Removing scout marker from ' + (fully ? 'and hiding ' : '') + this.numHiddenFromScouted + 'x ' + faction.name + ' pieces in ' + region.name);
        }
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const fully = this.fully;
        const hidden = region.getWarbandsOrAuxiliaForFaction(faction.id);
        if (hidden.length === 0) {
            return;
        }

        const piecesToScout = fully ? _.take(region.getHiddenPiecesForFaction(faction.id),
                                             this.numHiddenFromScouted) : _.take(
            region.getRevealedPiecesForFaction(faction.id), this.numHiddenFromScouted);

        _.each(piecesToScout, piece => {
            piece.scouted(true);
            piece.revealed(false);
        });

        const piecesToReveal = _.take(region.getHiddenPiecesForFaction(faction.id),
                                      this.numHiddenFromRevealed);
        _.each(piecesToReveal, piece => {
            piece.revealed(true);
        });

        if (this.numHiddenFromScouted > 0) {
            console.log(
                (fully ? 'Revealing and adding ' : 'Adding ') + 'scout marker to ' + this.numHiddenFromScouted + 'x ' + faction.name + ' pieces in ' + region.name);
        }

        if (this.numHiddenFromRevealed > 0) {
            console.log('Revealing ' + this.numHiddenFromRevealed + 'x ' + faction.name + ' pieces in ' + region.name);
        }
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const fully = this.fully;
        const instructions = [];
        if (this.numHiddenFromScouted > 0) {
            instructions.push(
                'Remove scouted marker from ' + (fully ? 'and hide ' : '') + this.numHiddenFromScouted + 'x ' + faction.name + ' pieces in ' + region.name);
        }
        if (this.numHiddenFromRevealed > 0) {
            instructions.push('Hide ' + this.numHiddenFromRevealed + 'x ' + faction.name + ' pieces in ' + region.name);
        }
        return instructions;
    }
}

export default HidePieces;