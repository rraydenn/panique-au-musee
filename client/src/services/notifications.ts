export class NotificationService {
  private static instance: NotificationService
  private permission: NotificationPermission = 'default'

  private constructor() {
    this.checkPermission()
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private async checkPermission(): Promise<void> {
    if ('Notification' in window) {
      this.permission = Notification.permission
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Ce navigateur ne supporte pas les notifications')
      return false
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission()
    }

    return this.permission === 'granted'
  }

  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) return
    }

    // Vérifier si l'application est en arrière-plan
    if (document.visibilityState === 'visible') {
      // Si l'app est visible, ne pas afficher de notification système
      return
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/favicon.ico',
      ...options
    }

    new Notification(title, defaultOptions)
  }

  showCaptureNotification(playerName: string, isCaptor: boolean): void {
    if (isCaptor) {
      this.showNotification('Capture réussie!', {
        body: `Vous avez capturé ${playerName}`,
        icon: '/icon-192x192.png',
        tag: 'capture-success'
      })
    } else {
      this.showNotification('Vous avez été capturé!', {
        body: 'Un policier vous a attrapé',
        icon: '/icon-192x192.png',
        tag: 'capture-victim'
      })
    }
  }

  showVitrineNotification(action: 'stolen' | 'secured'): void {
    const title = action === 'stolen' ? 'Vitrine volée!' : 'Vitrine sécurisée!'
    const body = action === 'stolen' ? 'Vous avez volé une vitrine' : 'Vous avez sécurisé une vitrine'
    
    this.showNotification(title, {
      body,
      icon: '/icon-192x192.png',
      tag: 'vitrine-action'
    })
  }

  showGameOverNotification(message: string): void {
    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/favicon.ico',
      body: message,
      tag: 'game-over'
    }

    if(this.permission === 'granted') {
      new Notification('Fin de la partie', defaultOptions)
    }
  }
}

export default NotificationService.getInstance()