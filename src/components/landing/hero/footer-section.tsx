"use client";

import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Logo } from "../logo";

interface FooterSectionProps {
  content: any;
}

export function FooterSection({ content }: FooterSectionProps) {
  return (
    <footer className="bg-card relative border-t border-border text-card-foreground py-12">
      <div className="container bottom-0 mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Logo />
            </div>
            <p className="text-muted-foreground">
              {content.footer.description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Produit</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors"
                >
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors"
                >
                  Tarifs
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Entreprise</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors"
                >
                  À propos
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors"
                >
                  Carrières
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Légal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors"
                >
                  Confidentialité
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors"
                >
                  Conditions
                </a>
              </li>
              <li>
                <a
                  href="/coming-soon"
                  className="hover:text-white transition-colors"
                >
                  RGPD
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center font-wear-tear font-thin text-muted-foreground">
          <span className="font-wear-tear text-[200px] text-foreground">
            DROP IN DROP
          </span>
        </div>
        <div className="border-t border-border mt-8 pt-8">
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
          <div className="text-center text-muted-foreground">
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
