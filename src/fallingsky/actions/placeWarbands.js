import Action from './action';

class PlaceWarbands extends Action {
    static canExecute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const count = args.count;

        return region.inPlay() && faction.hasAvailableWarbands(count);
    }

    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;
        const count = args.count;

        region.addPieces(faction.removeWarbands(count));
        console.log('Placing ' + count + 'x ' + faction.name + ' Warbands in ' + region.name);
    }
}

export default PlaceWarbands;