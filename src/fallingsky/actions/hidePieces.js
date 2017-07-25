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

        if(this.numHiddenFromRevealed > 0 ) {
            console.log('Hiding ' + this.numHiddenFromRevealed + 'x ' + faction.name + ' pieces in ' + region.name);
        }

        if(this.numHiddenFromScouted > 0) {
            console.log(
                'Removing scout marker from ' + this.numHiddenFromScouted + 'x ' + faction.name + ' pieces in ' + region.name);
        }
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

        if(this.numHiddenFromScouted > 0) {
            console.log(
                'Adding scout marker to ' + this.numHiddenFromScouted + 'x ' + faction.name + ' pieces in ' + region.name);
        }

        if(this.numHiddenFromRevealed > 0 ) {
            console.log('Revealing ' + this.numHiddenFromRevealed + 'x ' + faction.name + ' pieces in ' + region.name);
        }
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const instructions = [];
        if(this.numHiddenFromScouted > 0) {
            instructions.push(
                'Remove scouted marker from ' + this.numHiddenFromScouted + 'x ' + faction.name + ' pieces in ' + region.name);
        }
        if(this.numHiddenFromRevealed > 0 ) {
            instructions.push('Hide ' + this.numHiddenFromRevealed + 'x ' + faction.name + ' pieces in ' + region.name);
        }
        return instructions;
    }
}

export default HidePieces;