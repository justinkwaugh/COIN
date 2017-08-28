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
            debugger;
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
        if(this.count === 0) {
            return;
        }

        const revealable = _(region.getWarbandsOrAuxiliaForFaction(faction.id)).filter( piece => (piece.revealed() && !piece.scouted())).take(this.count).value();
        if (revealable.length === 0 ) {
            throw 'Unable to undo RevealPieces Action';
        }

        _.each(
            revealable, function (piece) {
                piece.revealed(false);
            });
        console.log('Hid ' + this.count + 'x ' + faction.name + ' pieces in ' + region.name);
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        if(this.count) {
            return ['Reveal ' + this.count + 'x ' + faction.name + ' pieces in ' + region.name];
        }
    }
}

export default RevealPieces;