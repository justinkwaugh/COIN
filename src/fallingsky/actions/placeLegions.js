import Action from './action';

class PlaceLegions extends Action {

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

        if(!region.inPlay() || !faction.hasAvailableLegions(count)) {
            throw 'Invalid PlaceLegions Action';
        }

        // Need to account for source
        region.addPieces(faction.removeLegions(count));
        console.log('Placing ' + count + 'x ' + faction.name + ' Legions in ' + region.name);
    }

    doUndo(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const count = this.count;

        throw 'Unable to undo PlaceLegions Action';
    }

        static canExecute(state, args) {
            const faction = args.faction;
            const region = args.region;
            const count = args.count;

            return region.inPlay() && faction.hasAvailableLegions(count);
        }
        static execute(state, args) {
            const faction = args.faction;
            const region = args.region;
            const count = args.count;

            region.addPieces(faction.removeLegions(count));
            console.log('Placing ' + count + 'x ' + faction.name + ' Legions in ' + region.name);
        }
    }

export default PlaceLegions;