import Action from './action';

class PlaceLeader extends Action {
    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];

        if(!region.inPlay() || !faction.hasAvailableLeader()) {
            throw 'Invalid PlaceAlliedTribe Action';
        }

        const leader = faction.removeLeader();
        region.addPiece(leader);
        console.log('Placing ' + leader.toString() + ' in ' + region.name);
    }

    doUndo(state) {
        throw 'Unable to undo PlaceFort Action';
    }

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