import BaseSvc from './BaseSvc'
import rimraf from 'rimraf'
import path from 'path'
import fs from 'fs'

export default class FileSvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor(config) {

    super(config)

    // start cleanup task to remove uploaded temp files
    setInterval(() => {
      this.clean(config.tempStorage, 60 * 60)
    }, 1000 * 60 * 60)

    setTimeout(() => {
      this.clean(config.tempStorage)
    }, 5 * 1000)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name() {

    return 'FileSvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  clean (dir, maxAge = 0) {

    console.log(`Cleaning Dir: ${dir}`)

    fs.readdir(dir, (err, files) => {

      if (err) {
        return console.error(err)
      }

      files.forEach((file) => {

        const filePath = path.join(dir, file)

        fs.stat(filePath, (err, stat) => {

          if (err) {
            return console.error(err)
          }

          const now = new Date()

          const age = (now - new Date(stat.ctime)) / 1000

          if (age > maxAge) {

            return rimraf(filePath, (err) => {

              if (err) {
                return console.error(err);
              }
            })
          }
        })
      })
    })
  }
}

