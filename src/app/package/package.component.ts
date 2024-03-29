import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../core/services';
import { LocalInstaller } from '../logic/LocalInstaller';
import { PackageListService } from '../package-list.service';
import { DatabaseHelperService, dbResponse } from '../database-helper.service';
import { Package } from '../logic/Package';

@Component({
  selector: 'app-package',
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.scss']
})
export class PackageComponent implements OnInit {
  private localInstaller: LocalInstaller
  public packageList: Array<Package> = [];

  searchRequestForm = new searchQueryForm('', 'all');
  addPackageForm = new createPackageForm('', '', '', '', '');

  constructor(private databaseHelper: DatabaseHelperService, private packageListService: PackageListService, private electronService: ElectronService) {
    this.localInstaller = new LocalInstaller(this.electronService);

    // get remote packages
    databaseHelper.getAllPackages()
      .then(packages => {
        this.packageList = this.packageList.concat(packages);
      }).then(packages => this.packageList = this.packageListService.$listInstall.concat(this.packageList))

    
  }

  ngOnInit(): void {

  }

  public handle() {
    let dir = document.getElementById('formFile') as HTMLInputElement;
    this.localInstaller.installFileFromLocal(dir.files, this.packageListService)
  }

  searchPackages() {
    this.packageList = []
    if (this.searchRequestForm.query === '') {
      this.databaseHelper.getAllPackages()
        .then(packages => { this.packageList = this.packageList.concat(packages) })
        .catch(() => this.packageList = []);

      this.packageList.concat(this.packageList = this.packageListService.$listInstall)
    } else {
      // local
      let list = this.packageListService.searchPackages(
        this.searchRequestForm.method,
        this.searchRequestForm.query
      )

      this.packageList = list;

      console.log(list)

      // remote
      this.databaseHelper.searchPackages(
        this.searchRequestForm.method,
        this.searchRequestForm.query
      )
      .then(packages => this.packageList = this.packageList.concat(packages))
    }

  }

  addPackage() {
    console.log(this.addPackageForm)

    // One of either has to be defined. But not both. (XOR)
    if ((this.addPackageForm.githubRepo && !this.addPackageForm.filePath) ||
      (!this.addPackageForm.githubRepo && this.addPackageForm.filePath)) {

      const dbRecord: dbResponse = {
        key: this.addPackageForm.name,
        organisation: this.addPackageForm.organisation,
        author: this.addPackageForm.author,
        githubRepo: this.addPackageForm.githubRepo,
        filePath: this.addPackageForm.filePath,
        nodes: []
      };

      this.databaseHelper.createPackage(dbRecord)
        .then(() => {
          this.addPackageForm = new createPackageForm('', '', '', '', '');
          this.searchRequestForm = new searchQueryForm('', 'all');
          this.searchPackages();
        })
        .catch((err) => {
          alert(`Error while creating package. Error: ${err}`)
        });

    }
  }

  removePackage(pack: Package) {
    if (confirm(`Are you sure you want to delete ${pack.$name}?`))
      this.databaseHelper.removePackage(pack.$name) // TODO of maak hier onderschijd tussen local.
        .then(() => {
          this.searchPackages();
          alert(`${pack.$name} is deleted.`)
        })
        .catch((err) => {
          // Check if local, if yes delete there
          try {
            this.packageListService.removeInstalledPackage(pack);
            this.searchPackages();
          } catch (err) {
            alert(`Error while removing package ${pack.$name}.`);
          }
        });

  }

  formValid: boolean = false;

  isFormValid() {
    // check if package add form is filled
    this.formValid = (
      this.addPackageForm.name !== '' &&
      this.addPackageForm.author !== '' &&
      this.addPackageForm.organisation !== '' &&
      !!((this.addPackageForm.githubRepo && !this.addPackageForm.filePath) ||
        (!this.addPackageForm.githubRepo && this.addPackageForm.filePath))
    )
  }

}

class searchQueryForm {
  constructor(
    public query: string,
    public method: 'name' | 'author' | 'organisation' | 'all'
  ) { }
}

class createPackageForm {
  constructor(
    public name: string,
    public author: string,
    public organisation: string,
    public githubRepo: string,
    public filePath: string
  ) { }
}