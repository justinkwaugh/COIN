import Aedui from '../factions/aedui';
import Arverni from '../factions/arverni';
import Belgae from '../factions/belgae';
import Romans from '../factions/romans';
import GermanicTribes from '../factions/germanicTribes';

class Factions {
    static generateFactions() {
        return [new Aedui(),
                new Arverni(),
                new Belgae(),
                new Romans(),
                new GermanicTribes()];
    }
}

export default Factions;