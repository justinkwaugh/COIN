import Action from './action';

class PlaceAuxilia extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.count = args.count;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const count = this.count;

        if(!region.inPlay() || !faction.hasAvailableAuxilia(count)) {
            throw 'Invalid PlaceAuxilia Action';
        }

        region.addPieces(faction.removeAuxilia(count));
        console.log('Placing ' + count + 'x ' + faction.name + ' Auxilia in ' + region.name);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const count = this.count;

        console.log('Removing ' + count + 'x ' + faction.name + 'Auxilia from ' + region.name);
        const auxilia = _.take(region.getHiddenPiecesForFaction(faction.id), count);
        if(auxilia.length !== count) {
            throw 'Unable to undo PlaceAuxilia Action';
        }
        region.removePieces(auxilia);
        faction.returnAuxilia(auxilia);
    }

    static canExecute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const count = args.count;

        return region.inPlay() && faction.hasAvailableAuxilia(count);
    }

    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const count = args.count;

        region.addPieces(faction.removeAuxilia(count));
        console.log('Placing ' + count + 'x ' + faction.name + ' Auxilia in ' + region.name);
    }
}

export default PlaceAuxilia;