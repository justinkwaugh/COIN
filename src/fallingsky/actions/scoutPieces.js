import _ from '../../lib/lodash';
import Action from './action';

class ScoutPieces extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.pieces = args.pieces;
        this.numScoutedFromHidden = args.numScoutedFromHidden || 0;
        this.numScoutedFromRevealed = args.numScoutedFromRevealed || 0;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const pieces = this.pieces;

        _.each(
            pieces, (piece) => {
                if (!piece.revealed()) {
                    piece.revealed(true);
                    this.numScoutedFromHidden += 1;
                }
                else {
                    this.numScoutedFromRevealed += 1;
                }
                piece.scouted(true);
            });

        if (pieces.length > 0 ) {
            console.log(
                'Scouting ' + this.numScoutedFromHidden + 'x hidden and ' + this.numScoutedFromRevealed + 'x revealed ' + faction.name + ' warbands in ' + region.name);
        }
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];

        const totalNumScouted = this.numScoutedFromHidden + this.numScoutedFromRevealed;
        const scoutedPieces = _.take(region.getScoutedPiecesForFaction(faction.id),totalNumScouted);
        _.each(scoutedPieces, (piece) => {
            piece.scouted(false);
            console.log('Removed scouted from  ' + totalNumScouted + 'x ' + faction.name + ' warbands in ' + region.name);
        });

        if(this.numScoutedFromHidden > 0 ) {
            const piecesToHide = _.take(scoutedPieces, this.numScoutedFromHidden);
            _.each(piecesToHide, (piece) => {
                piece.revealed(false);
                console.log(
                    'Hiding (as part of scout undo)  ' + this.numScoutedFromHidden + 'x ' + faction.name + ' warbands in ' + region.name);
            });
        }

    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const instructions = [];
        if (this.numScoutedFromHidden > 0) {
            instructions.push(
                'Flip to revealed and place scouted marker on ' + this.numScoutedFromHidden + 'x ' + faction.name + ' warbands in ' + region.name);
        }
        if (this.numScoutedFromRevealed > 0) {
            instructions.push(
                'Place scouted marker on ' + this.numScoutedFromRevealed + 'x already revealed ' + faction.name + ' warbands in ' + region.name);
        }
        return instructions;
    }
}

export default ScoutPieces;