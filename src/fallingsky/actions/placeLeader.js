import Action from './action';

class PlaceLeader extends Action {

    static canExecute(state, args) {
        const faction = args.faction;
        const region = args.region;

        return region.inPlay() && faction.hasAvailableLeader();
    }

    static execute(state, args) {
        const faction = args.faction;
        const region = args.region;

        const leader = faction.removeLeader();
        region.addPiece(leader);
        console.log('Placing ' + leader.toString() + ' in ' + region.name);
    }
}

export default PlaceLeader;