"use client";

import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Logo } from "../logo";

interface MobileFooterProps {
  content: any;
}

export function MobileFooter({ content }: MobileFooterProps) {
  return (
    <footer className="bg-card relative border-t border-border text-card-foreground px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Logo />
            </div>
            <p className="text-sm text-muted-foreground">
              {content.footer.description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">
              Produit
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors text-sm"
                >
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors text-sm"
                >
                  Tarifs
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors text-sm"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors text-sm"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">
              Entreprise
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors text-sm"
                >
                  À propos
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors text-sm"
                >
                  Carrières
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors text-sm"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground text-sm">
              Légal
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors text-sm"
                >
                  Confidentialité
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors text-sm"
                >
                  Conditions
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors text-sm"
                >
                  RGPD
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mb-6 font-wear-tear font-thin text-muted-foreground">
          <span className="font-wear-tear text-4xl text-foreground">
            DROP IN DROP
          </span>
        </div>

        <div className="border-t border-border pt-6">
          <div className="flex justify-center space-x-6 mb-4">
            <a
              href="/coming-soon"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="WhatsApp"
            >
              <FaWhatsapp className="w-6 h-6" />
            </a>
            <a
              href="/coming-soon"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <FaFacebook className="w-6 h-6" />
            </a>
            <a
              href="/coming-soon"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="w-6 h-6" />
            </a>
          </div>
          <div className="text-center text-muted-foreground text-sm">
            <p>
              &copy; {new Date().getFullYear()} drop-In-drop. Tous droits
              réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
