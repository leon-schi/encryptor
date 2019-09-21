import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: 'details.page.html',
  styleUrls: ['details.page.scss'],
})
export class DetailsPage implements OnInit {
    id: string;
    constructor(private route: ActivatedRoute) {
        console.log(route);
    }

    ngOnInit() {
    this.route.paramMap.subscribe(params => {
            this.id = params.get('id');
        });
    }

}
