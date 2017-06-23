import Action from './action'

class DisperseTribe extends Action {

    static canExecute(state, args) {
        const tribe = args.tribe;

        return tribe.isDispersed() || tribe.isDispersedGathering();
    }

    static execute(state, args) {
        const faction = args.faction;
        const tribe = args.tribe;

        if(tribe.isDispersedGathering()) {
            console.log(tribe.name + ' is now subdued');
            faction.returnDispersalToken();
        }
        else {
            console.log(tribe.name + ' is now gathering');
        }
        tribe.undisperse();
    }
}

export default DisperseTribe
