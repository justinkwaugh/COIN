import Action from './action';

class PlaceLegions extends Action {

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