import _ from '../../lib/lodash';
import Logging from '../util/logging';

class MarchResults {
    constructor(definition) {
        this.cost = definition.cost;
        this.region = definition.region;
        this.faction = definition.faction;
        this.mobilePieces = definition.mobilePieces;
        this.adjacentDestinations = definition.adjacentDestinations;
        this.destinations = definition.destinations;
        this.priority = definition.priority;
    }

    logResults() {
        console.log('*** March - ' + this.faction.name + ' can march from region ' + this.region.name + (this.priority ? ' with priority ' + this.priority : ''));
        console.log('Mobile pieces available: ');
        Logging.logPieces(this.mobilePieces);
        console.log('Possible destinations: ' + _.join(this.destinations));
    }
}

export default MarchResults;
